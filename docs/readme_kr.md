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
	해당 프로젝트를 <a href="https://toss.me/Sombian">지원</a> 해주실래요?
</div>

# 설명

`Daisuki`(은)는 [hitomi.la](https://hitomi.la)(을)를 위한 경량 데스크탑 프로그램입니다.

# 설치

```bash
git clone https://github.com/Any-Material/Daisuki.git
cd Daisuki
npm install
npm run serve
```

# 사용법

## 검색 양식

**속성** 비교의 양식은 다음과 같습니다.

```md
<식별자> = <값> or <식별자> != <값>
```

**함수** 호출의 양식은 다음과 같습니다.

```md
<식별자>(<값>, ..., <값>)
```

**값**은 다음을 허용합니다.

```md
<값> = <숫자> or <정수> or <논리형>
```

**연산자**는 이전 결과(이하 A)과 다음 검색어의 결과(이하 B)를 받아들인 후 다음과 같이 작동합니다.

### &

A 와 B 의 교집합을 연산합니다.

### +

A 와 B 의 합집합을 연산합니다.

### -

A 와 B 의 차집합을 연산합니다.

#

다음은 사용 가능한 **속성** 목록입니다.

```md
id = <정수>
type = <문자열>
group = <문자열>
series = <문자열>
artist = <문자열>
male = <문자열>
female = <문자열>
popular = <문자열>
character = <문자열>
language = <문자열>
```

다음은 사용 가능한 **함수** 목록입니다.


```md
title(value: <문자열>)
random(minimum: <정수>, maximum: <정수>)
```

다음은 실제 사용 예시입니다.

```md
language = "english" + title("just some title string") + id = 69
```

## Trivia

- **검색어 처리기**는 괄호의 중첩을 지원합니다.

- **문자열**은 큰따옴표만 지원합니다.

- `<identifier> != <literal>`(은)는 `(language = "all" - <identifier> = <literal>)`(와)과 같습니다.

- `id = <정수>`(은)는 항상 원소가 하나만 있는 집합을 반환하기에 **&**(을)를 사용하는 것은 추천하지 않습니다.

- 만약 오류가 발생했거나 연산 결과가 공집합일 경우 `language = "all"`의 결과가 반환됩니다.
