import { TV } from "@/types";
import { useEffect, useState } from "react";

export default function IndexScreen() {
  const [channels, setChannels] = useState<TV[]>([]);

  useEffect(() => {
    
    console.log("Hello");
  }, []);

  return (
    <>
    </>
  );
}