// common
import Unit from "@/app/common/unit";
import { Props, Casacade } from "@/app/common/props";
import { Stateless, StyleSheet } from "@/app/common/framework";

type GridRepeat = number | "auto" | "auto-fit" | "auto-fill";

function minmax(args: { minimum: Unit, maximum?: Unit }) {
	return "minmax(" + args.minimum + "," + (args.maximum ?? "auto") + ")";
}

function values(args: { values: Array<Unit> }) {
	return args.values.join("\u0020");
}

function attribute(args: ({ times: GridRepeat } & (Parameters<typeof minmax>[0] | Parameters<typeof values>[0])) | Array<Unit>): string {
	if (args instanceof Array) {
		return values({ values: args });
	} else if (typeof args.times === "number" || args.times === "auto-fit" || args.times === "auto-fill") {
		return "repeat(" + args.times + "," + attribute({ ...args, times: "auto" }) + ")";
	}
	return args.hasOwnProperty("values") ? values(args as Parameters<typeof values>[0]) : minmax(args as Parameters<typeof minmax>[0]);
}

function property(args: Parameters<typeof attribute>[0], type: "rows" | "columns") {
	if (args instanceof Array || args.times !== "auto") {
		return "gridTemplate" + type.replace(/^([A-Za-z])([A-Za-z]+)$/, ($0, $1, $2) => $1.toUpperCase() + $2);
	}
	return "gridAuto" + type.replace(/^([A-Za-z])([A-Za-z]+)$/, ($0, $1, $2) => $1.toUpperCase() + $2);
}
/**
 * e.g.
 * ```
 * <Grid.Layout
 * 	row={[
 *		// values
 * 	]}
 * 	column={[
 *		// values
 * 	]}
 * 	areas={[
 * 	["A", "C", "C"],
 * 	["A", "B", "B"],
 * 	["A", "B", "B"]
 * 	]}>
 * 	<Cell id={"A"}/>
 * 	<Cell id={"B"}/>
 * 	<Cell id={"C"}/>
 * </Grid.Layout>
 * ```
 */
class GridProps extends Props<Children> {
	public readonly gap?: Unit;
	public readonly rows: Parameters<typeof attribute>[0];
	public readonly columns: Parameters<typeof attribute>[0];
	public readonly template?: Array<Array<String>>;

	constructor(args: Args<GridProps>) {
		super(args);

		this.gap = args.gap;
		this.rows = args.rows;
		this.columns = args.columns;
		this.template = args.template;
	}
}

class Grid extends Stateless<GridProps> {
	protected postCSS(): React.CSSProperties {
		return {
			display: "grid",
			gridGap: this.props.gap,
			[property(this.props.rows, "rows")]: attribute(this.props.rows),
			[property(this.props.columns, "columns")]: attribute(this.props.columns),
			gridTemplateAreas: this.props.template?.map((area) => "\"" + area.join("\u0020") + "\"").join("\u0020")
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

class CellProps extends Casacade {
	public readonly area: string;
	public readonly overflow?: boolean;

	constructor(args: Args<CellProps>) {
		super(args);

		this.area = args.area;
		this.overflow = args.overflow;
	}
}

class Cell extends StyleSheet<CellProps> {
	protected postCSS(): React.CSSProperties {
		return {
			gridArea: this.props.area,
			overflow: this.props.overflow ? "visible" : undefined
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export {
	Grid,
	Cell
}
