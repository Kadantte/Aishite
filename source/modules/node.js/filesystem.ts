import node_fs from "fs";
import node_path from "path";

class FileSystem {
	public list(path: string) {
		return node_fs.readdirSync(path);
	}
	public read(path: string) {
		return node_fs.readFileSync(path, "utf-8");
	}
	public write(path: string, content: string) {
		node_fs.mkdirSync(node_path.dirname(path), { recursive: true });
		node_fs.writeFileSync(path, content);
	}
	public delete(path: string) {
		node_fs.unlinkSync(path);
	}
	public combine(...segments: Array<string>) {
		return node_path.resolve(...segments);
	}
	public filename(path: string) {
		return node_path.basename(path);
	}
	public extension(path: string) {
		return node_path.extname(path);
	}
	public directory(path: string) {
		return node_path.dirname(path);
	}
}

const singleton = new FileSystem();

export default singleton;
