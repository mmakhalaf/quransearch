
export function params_to_string(params: any): string {
   let pstr = '';
   if (params.size == 0) {
      return pstr;
   }

   for (let k in params) {
      let v = params[k];
      pstr += `${k}=${v}&`;
   }

   return pstr.substr(0, pstr.length - 1);
}