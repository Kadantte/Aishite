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
	Care to <a href="https://toss.me/Sombian">Support</a> this project?
</div>

# About

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

For **property** comparisons, syntax is as followed.

```md
<identifier> = <literal> or <identifier> != <literal>
```

For **function** calls, syntax is as followed.

```md
<identifier>(<literal>) or <identifier>(<literal>, ..., <literal>)
```

**Literal** can be any of followed.

```md
<literal> = <number> or <string> or <boolean>
```

The operator accepts the previous result (hereinafter A) and the result of the next search term (hereinafter B) and then operates as follows:

### &

Compute the intersection of A and B.

### +

Compute the sum of A and B.

### -

Compute the set of differences between A and B.

#

Below is full list of available **properties**.

```md
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

Below is full list of available **functions**.

```md
title(value: <string>)
random(minimum: <number>, maximum: <number>)
```

Below is a usage example.

```md
language = "english" + title("just some title string") + id = 69
```

## Trivia

- Nested parentheses is supported.

- `<string>` only allows double quotes.

- `<identifier> != <literal>` is a shorthand of `(language = "all" - <identifier> = <literal>)`.

- `<id> = <number>` only return single element collection, therefore using **&** operator is not encouraged.

- If **parser** fails under any circumstances or result collection is empty, result of `language = "all"` will return as a fallback.
