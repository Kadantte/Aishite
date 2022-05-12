import Page from "@/app/pages";

import { Clear } from "@/app/common/props";

interface FallbackProps extends Clear<undefined> {
	// TODO: WIP
}

interface FallbackState {
	// TODO: WIP
}

class Fallback extends Page<FallbackProps, FallbackState> {
	protected create() {
		return ({});
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build(): Child {
		throw new Error("Unimplemented");
	}
}

export default Fallback;
