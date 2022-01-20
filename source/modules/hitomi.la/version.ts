// modules
import request from "@/modules/request";

export type GalleryVersion = "tagindex" | "galleriesindex" | "languagesindex" | "nozomiurlindex";

export const GalleryVersion = {
	tagindex: null as Nullable<string>,
	galleriesindex: null as Nullable<string>,
	languagesindex: null as Nullable<string>,
	nozomiurlindex: null as Nullable<string>
};

for (const directory of ["tagindex", "galleriesindex", "languagesindex", "nozomiurlindex"]) {
	request.GET(`https://ltn.hitomi.la/${directory}/version?_=${Date.now()}`, "text").then((response) => {
		GalleryVersion[directory as GalleryVersion] = response.encode;
	});
}
