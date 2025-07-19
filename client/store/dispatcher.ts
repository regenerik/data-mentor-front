import { Dispatcher } from "flux";

export interface FluxAction {
  type: string;
  payload?: any;
}

class AppDispatcher extends Dispatcher<FluxAction> {}

export default new AppDispatcher();
