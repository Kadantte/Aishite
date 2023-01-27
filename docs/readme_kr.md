<div align="center">
	<img width="250px" src="https://github.com/Any-Material/Daisuki/blob/master/docs/images/icon.png?raw=true" align="center" alt="Daisuki"/>
</div>
<div align="center">
	<a href="https://github.com/Any-Material/Daisuki/blob/master/README.md">English</a>
</div>
<div align="center">
	<a href="https://github.com/Any-Material/Daisuki/releases">다운로드</a>
	·
	<a href="https://github.com/Any-Material/Daisuki/issues/new">오류 제보</a>
</div>
<div align="center">
	소중한 <a href="/docs/donation.md">후원</a> 부탁드립니다...
</div>

# 설명

[![Downloads](https://img.shields.io/github/downloads/Any-Material/Aishite/total.svg)](https://github.com/Any-Material/Aishite/releases)

`Daisuki`(은)는 [hitomi.la](https://hitomi.la)(을)를 위한 경량 데스크탑 프로그램입니다.

# 설치

```bash
git clone https://github.com/Any-Material/Daisuki.git
cd Daisuki
npm install
npm run serve
```

# 후원

[바로가기](https://github.com/Any-Material/Daisuki/blob/master/docs/donation.md)

# 사용법

## 검색 양식

- **속성 비교**

	```html
	<식별자> = <값> or <식별자> != <값>
	```

- **함수 호출**

	```html
	<식별자>(<값_1st>, <값_2nd>, ..., <값_nth>)
	```

- **값(literal)**

	```html
	<값> = <숫자> or <정수> or <논리형>
	```

	e.g.

	```html
	123

	'example'
	"example"

	true
	false
	```

- **연산자**

	연산자는 이전 결과(이하 A)과 다음 검색어의 결과(이하 B)를 받아들인 후 다음과 같이 작동합니다.

	- **&**

		A 와 B 의 교집합을 연산합니다.

	- **+**

		A 와 B 의 합집합을 연산합니다.

	- **-**

		A 와 B 의 차집합을 연산합니다.

- **속성**

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

- **함수**

	```ts
	title(value: <string>)
	```

	주어진 제목으로 갤러리들을 검색합니다.

	*결과가 매우 제한됩니다.*

	```ts
	random(minimum: <number>, maximum: <number>)
	```

	주어진 범위 내의 무작위 갤러리 한개를 반환합니다.

	*오로지 시험용으로 만들어진 함수입니다.*

	```ts
	shortcut(value: <string>)
	```

	`settings.json/apis/search/%key%` 에 저장된 문자열 값을 처리한 결과를 반환합니다.

	*해당 함수는 무한 재귀 호출의 가능성이 있으며 자원이 많이 소모될 수 있습니다.*

- **사용법**

	```ts
	language = "english" + title("just some title string") + id = 69
	```

- **기타**

	+ 검색어 처리기는 괄호의 중첩을 지원합니다.

	+ `<identifier> != <literal>`(은)는 `(language = "all" - <identifier> = <literal>)`(와)과 같습니다.

	+ `id = <정수>`(은)는 항상 원소가 하나만 있는 집합을 반환하기에 **&**(을)를 사용하는 것은 추천하지 않습니다.

	+ 만약 처리중 오류가 발생했거나 연산 결과가 공집합일 경우 `language = "all"`의 결과가 반환됩니다.
