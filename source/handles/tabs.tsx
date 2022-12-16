import Viewer from "app/pages/viewer";
import Browser from "app/pages/browser";
import Fallback from "app/pages/fallback";

import options from "handles/options";

import { StateHandler } from "handles/index";

class Tabs extends StateHandler<TabsState> {
	public get state() {
		return super.state;
	}
	public set state(state: Tabs["_state"]) {
		// assign
		super.state = state;
		// update
		update_title();
		update_settings();
	}
	protected create() {
		// update
		update_title(this.page);
	}
	public get page() {
		return this.state.pages[this.state.index];
	}
	/** Back to initial state. */
	public reset() {
		this.state = {
			index: 0,
			pages: [builder("NEW TAB", "BROWSER", {})]
		};
	}
	/** Append `page` as well as change `this.state.index`. */
	public open(title: string, type: string, args: Record<string, unknown>) {
		this.state = {
			index: this.state.pages.length,
			pages: [...this.state.pages, builder(title, type, args)]
		};
	}
	/** Jump to given index. */
	public jump(index: number) {
		this.state = {
			index: index,
			pages: this.state.pages
		};
	}
	/** Close `page` at given index, default to `this.state.index`. */
	public close(index: number = this.state.index) {
		switch (this.state.pages.length) {
			case 1: {
				this.reset();
				break;
			}
			default: {
				this.state = {
					index: this.state.index,
					pages: [...this.state.pages.take(index), ...this.state.pages.skip(index + 1)]
				};
				break;
			}
		}
	}
	/** Rename `page` at given index, default to `this.state.index`. */
	public rename(title: string, index: number = this.state.index) {
		this.state = {
			index: this.state.index,
			pages: [...this.state.pages.take(index), { ...this.state.pages[index], title: title }, ...this.state.pages.skip(index + 1)]
		};
	}
	/** Replace current `page` with new `page`. */
	public replace(title: string, type: string, args: Record<string, unknown>) {
		this.state = {
			index: this.state.index,
			pages: [...this.state.pages.take(this.state.index), builder(title, type, args), ...this.state.pages.skip(this.state.index + 1)]
		};
	}
	/** Reorder array of `page`. */
	public reorder(destination: number) {
		this.state = {
			index: destination,
			pages: this.state.pages.map((page, index) => index === this.state.index ? this.state.pages[destination] : index === destination ? this.state.pages[this.state.index] : page)
		};
	}
}

interface Page {
	title: string;
	element: JSX.Element;
}

class TabsState {
	public index: number;
	public pages: Array<Page>;

	constructor(args: Args<TabsState>) {
		this.index = args.index.clamp(0, args.pages.length - 1);
		this.pages = args.pages;
	}
}

const cache = new Map<string, Nullable<React.Component>>();

function unique(): string {
	// cache
	const namespace = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	// prevent duplication
	if (cache.has(namespace)) {
		// recursive
		return unique();
	}
	return namespace;
}

function proxy(uuid: string, ref: Nullable<React.Component>) {
	// skip
	if (ref === null) return;

	cache.set(uuid, ref);

	if (ref?.componentDidUpdate) ref.componentDidUpdate = inject(ref.componentDidUpdate, () => update_settings());
	if (ref?.componentWillUnmount) ref.componentWillUnmount = inject(ref.componentWillUnmount, () => cache.delete(uuid));
}

function builder(title: string, type: string, args: Record<string, unknown>, uuid: string = unique()) {
	// cache
	const page = { title: title } as Page;

	switch (type.toUpperCase()) {
		case "FALLBACK": {
			page.element = (<Fallback ref={(ref) => proxy(uuid, ref)} key={uuid} data-key={uuid} {...options.state.override.fallback}></Fallback>);
			break;
		}
		case "BROWSER": {
			page.element = (<Browser ref={(ref) => proxy(uuid, ref)} key={uuid} data-key={uuid} index={args.index as number ?? 0} value={args.value as string ?? "language = \"all\""} {...options.state.override.browser}></Browser>);
			break;
		}
		case "VIEWER": {
			page.element = (<Viewer ref={(ref) => proxy(uuid, ref)} key={uuid} data-key={uuid} width={args.width as number ?? app.min_width} gallery={args.gallery as number ?? 0} {...options.state.override.viewer}></Viewer>);
			break;
		}
		default: {
			page.element = (<section key={uuid} data-key={uuid}>UNKNOWN</section>);
			break;
		}
	}
	return page;
}

/** **Webpack** in fact change classes' name thus `constructor.name` isn't static, so this function has born. **tl;dr**: class name anchor. */
function type(element: JSX.Element) {
	switch (element.type) {
		case Fallback: {
			return "FALLBACK";
		}
		case Browser: {
			return "BROWSER";
		}
		case Viewer: {
			return "VIEWER";
		}
		default: {
			return "UNKNOWN";
		}
	}
}

function args(element: JSX.Element) {
	// cache
	const [props, component] = [element.props, cache.get(element.props["data-key"])];

	if (!component) return props;

	const state = component.state as any;

	switch (element.type) {
		case Fallback: {
			return {};
		}
		case Browser: {
			return { value: state["search"]["value"] ?? props["value"], index: state["search"]["index"] ?? props["index"] };
		}
		case Viewer: {
			return { width: state["width"] ?? props["width"], gallery: props["gallery"] };
		}
		default: {
			return {};
		}
	}
}

function update_title(page: Page = singleton.state.pages[singleton.state.index]) {
	document.title = type(page.element) + space + "-" + space + page.title;
}

function update_settings() {
	options.state = {
		...options.state,
		history: {
			index: singleton.state.index,
			pages: singleton.state.pages.map((page) => ({ type: type(page.element), name: page.title, args: args(page.element) }))
		}
	};
}

const singleton = new Tabs(
	new TabsState({
		index: options.state.history.index,
		pages: options.state.history.pages.map((page) => builder(page.name, page.type, page.args))
	})
);

export default singleton;
