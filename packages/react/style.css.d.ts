// Side-effect CSS entry point (@g3t/react/style.css).
//
// Under node16/nodenext resolution TypeScript rejects a side-effect
// import whose specifier has no declaration (TS2882), so a consumer
// following the documented first line of the quickstart could not
// compile. This declaration exists solely so that import resolves;
// the stylesheet itself is dist/style.css.
declare const styles: void;
export default styles;
