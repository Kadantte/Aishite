import { Tag } from "models/tag";

export abstract class Gallery {
	public readonly id: number;
	public readonly type: string;
	public readonly title: string;
	public readonly group?: string;
	public readonly parody?: string;
	public readonly artists: Array<string>;
	public readonly language: string;
	public readonly thumbnail: Array<string>;
	public readonly tags: Array<Tag>;
	public readonly date: string;

	constructor(args: Args<Gallery>) {
		this.id = args.id;
		this.type = args.type;
		this.title = args.title;
		this.group = args.group;
		this.parody = args.parody;
		this.artists = args.artists;
		this.language = args.language;
		this.thumbnail = args.thumbnail;
		this.tags = args.tags;
		this.date = args.date;
	}
	public abstract URL(): string;
	public abstract files(): Promise<Array<GalleryFile>>;
}

export class GalleryFile {
	public readonly url: string;

	constructor(args: Args<GalleryFile>) {
		this.url = args.url;
	}
}
