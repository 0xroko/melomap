import "csstype";
declare module "csstype" {
  interface Properties {
    // ...or allow any other property
    [index: string]: any;
  }
}
