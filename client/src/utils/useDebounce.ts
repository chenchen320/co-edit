import React from "react";
export default function useDebounce(callback:Function,delay:number) {
  const timer = React.useRef<any>();

  return(...args:any[]) =>{
    if(timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(()=>{
      callback(...args);
    },delay)
  }
}