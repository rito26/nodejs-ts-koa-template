type RemoveLineFeed<T extends string> = 
    T extends `\n${infer A}` ? 
        A extends `${infer B}\n` ? B
        : A
    : T extends `${infer A}\n` ? A : T;
;

type Trim<T extends string, Acc extends string = "", Separator extends string = " "> 
    = T extends `${infer Char}${infer Rest}`
        ? (Char extends Separator
            ? Trim<Rest, Acc>
            : Trim<Rest, `${Acc}${Char}`>)
        : (T extends ""
            ? Acc
            : never);

// type Trim<T extends string> = 
//       T extends ` ${infer Tail}`
//         ? Trim<Tail> 
//         : T extends `${infer Head} `
//             ? Trim<Head>
//             : T extends `${infer Head} ${infer Tail}`
//                 ? Trim<`${Head}${Tail}`>
//                 : T;

type TrimComments<T extends string> = 
      T extends `${infer Head}#${any}\n${infer Tail}`
        ? TrimComments<`${Head}\n${Tail}`> 
    : T extends `${infer Head}--${any}\n${infer Tail}`
        ? TrimComments<`${Head}\n${Tail}`>
    : T extends `${infer Head}/*${any}*/${infer Tail}`
        ? TrimComments<`${Head}${Tail}`>
    // : T extends `${infer Head}#${any}\r\n${infer Tail}`
    //     ? TrimComments<`${Head}\r\n${Tail}`>
    // : T extends `${infer Head}--${any}\r\n${infer Tail}`
    //     ? TrimComments<`${Head}\r\n${Tail}`>
    : T;

type ParseQueryBegin<T extends string>
    = T extends `${string}{${infer I}}${infer Tail}` ? 
        { i: I, tail: Tail } : 
        never;

type ParseQueryRecur<T extends { i: string, tail: any }>
    = T extends never ? never :
      T["tail"] extends `${string}{${infer I}}${infer TailNext}` ? 
        ParseQueryRecur<{ i: T["i"] | I, tail: TailNext }> :
        T["i"];

type ParseQueryToInputUnion<T extends string> = ParseQueryRecur<ParseQueryBegin<T>>;
type TrimmedQueryInputUnion<T extends string>
    = ParseQueryToInputUnion<
        Trim<
            TrimComments<T>
        >
    >;

/**
 * 쿼리 문자열에서 {input} 값들을 오브젝트 형태로 추출
 */
export type ExtractInputFromQuery<T extends string> 
    = TrimmedQueryInputUnion<T> extends never ? undefined :
        Record< TrimmedQueryInputUnion<T>, any >;

// 특정 키워드 포함하도록 제약
export type SelectQuery = `${any}SELECT${any}` | `${any}select${any}` | `${any}Select${any}`;
export type InsertQuery = `${any}INSERT${any}` | `${any}insert${any}` | `${any}Insert${any}`;
export type DeleteQuery = `${any}DELETE${any}` | `${any}delete${any}` | `${any}Delete${any}`;
export type UpdateQuery = `${any}UPDATE${any}` | `${any}update${any}` | `${any}Update${any}`;
// export type ExtractInputFromSelectQuery<T extends `${any}SELECT${any}` | `${any}select${any}`> 
//     = ExtractInputFromQuery<T>; 
// -----------------------------------------------------------
type ExtractSelectBody<T extends string> = 
    T extends `${string}SELECT${infer Body}FROM${string}` ? 
        Body : never;

type SplitComma<T extends string, TUnion = never> = 
    T extends `${infer Head},${infer Tail}` ? 
        SplitComma<Tail, TUnion | Head>
        : TUnion | T;

type PickAlias<T extends string> = 
    T extends `${any}AS ${infer Alias}` ? Alias : 
    T extends `${any}as ${infer Alias}` ? Alias : 
    T;

type SnakeToCamelCase<T extends string> =
    T extends `${infer Head}_${infer Tail}` ?
        `${Head}${Capitalize<SnakeToCamelCase<Tail>>}` : T;

/**
 * 쿼리 문자열에서 SELECT ~ FROM 사이의 컬럼들을 오브젝트 형태로 추출
 */
export type ExtractOutputFromQuery<T extends string> = 
    T extends `${string}SELECT *${string}` ? Record<string, any> :
    T extends `${string}SELECT${string}` ? 
        (
            Record<
                SnakeToCamelCase<
                RemoveLineFeed<
                Trim<
                PickAlias<
                SplitComma<
                ExtractSelectBody<
                TrimComments<T>
                >
                >
                >
                >
                >
                >
            , any>
        )
        : any;

// type Example_ExtractOutput = ExtractOutputFromQuery<`
//     SELECT user_id,
//            user_name AS name,
//            user_phone_number -- 코멘트1
//           ,pass_word AS pw    # 코멘트2
//           ,years_old         /* 코멘트3 */
//       FROM table
//      WHERE ANY_CONDITIONS
// `>;