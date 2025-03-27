export const createPacket = (method: "SET" | "GET", type: string, attribute: string, data: string | number) => {
  return `*START! *${method}!!!$$${type} *${attribute}$$${data.toString().padEnd(10, "!")}$$RESERVED$$ENDOFPKT\n`;
};

export const parsePacket = (packet: string) => {
  const match = packet.match(/\*START!\s\*(\S+?)!!!\$\$(\S+?)\s\*(\S+?)\$\$([-!~\w.]+)\$\$RESERVED\$\$ENDOFPKT/);
  if (match) {
    return {
      method: match[1],
      type: match[2],
      attribute: match[3],
      data: match[4].replace(/!+/g, ""),
    };
  }
  return null;
};
