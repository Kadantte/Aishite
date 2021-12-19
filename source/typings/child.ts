declare type TextChild = Array<string> | string;

declare type ArrayChild = Array<SingleChild> | SingleChild;

declare type SingleChild = JSX.Element | Element | undefined;
