import { h, Component } from "@stencil/core";

@Component({ tag: 'ins-content' })
export class InsContent {
  render(){
    return(<div><slot /></div>)
  }
}
