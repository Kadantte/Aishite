<div align="center">
	<img width="250px" src="https://github.com/Any-Material/Daisuki/blob/master/docs/images/icon.png?raw=true" align="center" alt="Daisuki"/>
</div>
<div align="center">
	<a href="/docs/readme_kr.md">한국어</a>
</div>
<div align="center">
	<a href="https://github.com/Any-Material/Daisuki/releases">Download</a>
	·
	<a href="https://github.com/Any-Material/Daisuki/issues/new">Report Bug</a>
</div>
<div align="center">
	Care to <a href="/docs/donation.md">Support</a> this project?
</div>

# About

[![Downloads](https://img.shields.io/github/downloads/Any-Material/Aishite/total.svg)](https://github.com/Any-Material/Aishite/releases)

`Daisuki` is a fully secure, and light-weight desktop application for [hitomi.la](https://hitomi.la)  

# Installation

```bash
git clone https://github.com/Any-Material/Daisuki.git
cd Daisuki
npm install
npm run serve
```

# Instruction

## Search Syntax

- **Property Comparison**

	```html
	<identifier> = <literal> or <identifier> != <literal>
	```

- **Function Call**

	```html
	<identifier>(<literal>) or <identifier>(<literal_1st>, <literal_2nd>..., <literal_nth>)
	```

- **Literal Value**

	```html
	<literal> = <number> or <string> or <boolean>
	```
	
	e.g.

	```html
	123

	'example'
	"example"

	true
	false
	```

- **Operators**

	The parser accepts the previous result (hereinafter A) and the result of the next search term (hereinafter B) and then operates as follows:

	- **&**

		Compute the intersection of A and B.

	- **+**

		Compute the sum of A and B.

	- **-**

		Compute the set of differences between A and B.

- **Properties**

	```ts
	id = <number>
	type = <string>
	group = <string>
	series = <string>
	artist = <string>
	male = <string>
	female = <string>
	popular = <string>
	character = <string>
	language = <string>
	```

- **Functions**

	```ts
	title(value: <string>)
	```

	Search galleries by given title.

	*Result is very restricted.*

	```ts
	random(minimum: <number>, maximum: <number>)
	```

	Return a random gallery between range provided.

	*This function was purely made for test purpose.*

	```ts
	shortcut(value: <string>)
	```

	Return the result of processing pre-defined string value stored in `settings.json/apis/search/%key%`.

	*This function can lead to infinite recursion and may be resource intensive.*

- **Usage**

	```ts
	language = "english" + title("just some title string") + id = 69
	```

- **Trivia**

	+ Nested parentheses is supported.

	+ `<identifier> != <literal>` is a shorthand of `(language = "all" - <identifier> = <literal>)`.

	+ `<id> = <number>` only return single element collection, therefore using **&** operator is not encouraged.

	+ If parser fails under any circumstances or result collection is empty, result of `language = "all"` will return as a fallback.
