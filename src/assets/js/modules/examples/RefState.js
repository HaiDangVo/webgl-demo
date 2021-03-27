import BaseModule from "../BaseModule";
import refState from "../../libs/ModuleState";

export default class RefState extends BaseModule {
  register() {
    console.log('RefState! ', this)
    //
    const myData = refState('myData', 'inited value')
    console.log(myData.get)
    myData.onChange(console.log)
    myData.set('changed value')
  }
}
