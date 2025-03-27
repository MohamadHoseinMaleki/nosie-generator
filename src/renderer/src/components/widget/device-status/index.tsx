import { Badge } from "@renderer/components/ui/badge";
import { Button } from "@renderer/components/ui/button";
import PerformanceIndicator from "./performance-indicator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, CheckIcon, Loader2Icon, RefreshCwIcon, Unplug, XIcon } from "lucide-react";
import { createPacket, parsePacket } from "@renderer/helper/packet";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";
import { sleep } from "@renderer/utils/sleep";
import ExitButton from "./exit-button";

type ConnectionStatus = "idle" | "loading" | "connected" | "error" | "disconnect";
type ListStatus = "loading" | "success" | "failure";

const DeviceStatus = (): JSX.Element => {
  const { data, updateField, setOnInitial } = useDeviceSettings();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [listStatus, setListStatus] = useState<ListStatus>("loading");

  const [ports, setPorts] = useState<any[]>([]);
  const [selectedPort, setSelectedPort] = useState<null | any>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const connectToPort = async () => {
    setConnectionStatus("loading");
    try {
      await window.context.serialPort.connect(selectedPort);
      setConnectionStatus("connected");
      toast(`Connected to port ${selectedPort}`, {
        icon: <Check className="text-green-600" />,
      });
    } catch (error) {
      console.error("Error connecting to port:", error);
      setConnectionStatus("error");
      toast("Connecting to port failed", {
        icon: <XIcon className="text-red-600" />,
      });
    }
  };

  const getAllPorts = async () => {
    toast("Load all ports", {
      icon: <Loader2Icon className="animate-spin text-blue-600 duration-1000" />,
      id: "get-ports",
    });
    try {
      const portList = await window.context.serialPort.list();
      setPorts(portList);
      setListStatus("success");
      await sleep(1000);
      toast("Ports loaded successfully", {
        icon: <Check className="text-green-600" />,
        id: "get-ports",
      });
    } catch {
      setListStatus("failure");
      toast("Load all ports failed", {
        icon: <XIcon className="text-red-600" />,
        id: "get-ports",
      });
    }
  };

  const getAllData = async () => {
    const port = await window.context.serialPort.portInfo();
    if (port) {
      for (const type in data) {
        for (const attr in data[type]) {
          window.context.serialPort.write(createPacket("GET", type, attr, ""));
        }
      }
      // const customPacket = "*START! *GET!!!$$NOISES *NOISESS$$!!!!!!!!!!$$RESERVED$$ENDOFPKT\n";
      // const customPacket = createPacket("GET", "NOISES", "NOISESS", "");
      
      // await sleep(600);
      // window.context.serialPort.write(createPacket("GET", "NOISES", "NOISESS", ""));
    }
  };

  const handleRefresh = async () => {
    const port = await window.context.serialPort.portInfo();
    if (port && connectionStatus === "connected" && !isRefreshing) {
      setIsRefreshing(true);
      toast("Refreshing...", {
        id: "refresh-loading",
        icon: <Loader2Icon className="animate-spin text-blue-600 duration-1000" />,
      });
      await getAllData();
      await sleep(3000);
      setIsRefreshing(false);
      toast("Refresh finished", {
        id: "refresh-loading",
        icon: <CheckIcon className="text-green-600" />,
      });
    }
  };

  const disconnect = () => {
    window.context.serialPort.disconnect();
    setConnectionStatus("disconnect");
    toast("Port Disconnected", {
      icon: <Unplug className="text-red-600" />,
    });
  };

  //add mapping for fields
  const fieldNameMapping: Record<string, string> = {
    // SINGLE
    FREQCY0: "Single Frequency 0",
    ATTENV0: "Single Attenuation Level 0",

    // SWEEPF
    MINFREQ: "Sweep Min Frequency",
    MAXFREQ: "Sweep Max Frequency",
    STPFREQ: "Sweep Step Frequency",
    SWPTIME: "Sweep Time",
    ATTENVL: "Sweep Attenuation Level",
    REVERSE: "Reverse Sweep",

    // MULTON
    FREQCY1: "Multi-Tone Frequency 1",
    FREQCY2: "Multi-Tone Frequency 2",
    FREQCY3: "Multi-Tone Frequency 3",
    FREQCY4: "Multi-Tone Frequency 4",
    ATTENV1: "Attenuation Level 1",
    ATTENV2: "Attenuation Level 2",
    ATTENV4: "Attenuation Level 4",
    ATTENV3: "Attenuation Level 3",
    MSELECT: "Selection",
    // FNOISE
    NOISEBW: "Noise Bandwidth",
    SHFFREQ: "Shift Frequency",
    SHFENBL: "Shift Enable",
    // BARAGE
    BNUMBER: "Barrage Number",
    // DELDOP
    DELAYEN: "Doppler Delay Enable",
    DOPLREN: "Doppler Enable",
    DLYVALU: "Doppler Delay Value",
    DOPFREQ: "Doppler Frequency",
    // NOISES
    NOISESS: "Noise Signal Strength",
    PSGMODE: "Noise PSG Mode",
    ONDETER: "pulse OnTime",
    OFFDETR: "pulse OffTime",
    ONSTOCH: "R.pulse OnTime ",
    OFFSTOC: "R.pulse OffTime ",
    // LOFATT
    LOFRQCY: "Frequency",
    TXATTEN: "Frequency-Attenuation",

    // DPOWER
    TXPOWER: "Transmission Power",
  };

  const handleResponse = (chunk: string) => {
    console.log("Received data:", chunk); // لاگ داده‌های دریافتی
    const parsedResponse = parsePacket(chunk);
    if (parsedResponse) {
      console.log("Parsed response:", parsedResponse); // لاگ داده‌های پارس شده
      const fieldName = fieldNameMapping[parsedResponse.attribute] || parsedResponse.attribute;
  
      switch (parsedResponse.method) {
        case "SET": {
          switch (parsedResponse.data.toLowerCase()) {
            case "ok":
              setTimeout(() => {
                // toast(`${fieldName}: set successfully`, {
                //   icon: <CheckIcon className="text-green-600" />,
                // });
              });
              break;
  
            default:
              setTimeout(() => {
                toast(`Error in ${fieldName}: ${parsedResponse.data}`, {
                  icon: <XIcon className="text-red-600" />,
                });
                setOnInitial(parsedResponse.type, parsedResponse.attribute);
              });
              break;
          }
          break;
        }
  
        case "GET": {
          updateField(parsedResponse.type, parsedResponse.attribute, parsedResponse.data);
          break;
        }
  
        default:
          break;
      }
    } else {
      console.error("Failed to parse response:", chunk); // لاگ خطای پارس
    }
  };

  useEffect(() => {
    getAllPorts();
  }, []); // بارگذاری اولیه پورت‌ها
  
  useEffect(() => {
    if (connectionStatus === "connected") {
      window.context.serialPort.onData(handleResponse);
      getAllData(); // درخواست داده‌ها پس از اتصال
    }
  
    return () => {
      window.context.serialPort.removeOnData();
    };
  }, [connectionStatus]); // وابستگی به connectionStatus

  // useEffect(() => {
  //   if (connectionStatus === "connected") {
  //     getAllData();
  //   }
  // }, [connectionStatus]);

  const renderStatusBadge = () => {
    switch (connectionStatus) {
      case "loading":
        return <Badge variant="secondary">Connecting...</Badge>;
      case "connected":
        return <Badge variant="default">Connected</Badge>;
      case "error":
        return <Badge variant="destructive">Connection Failed</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const handleConnectionLost = () => {
    if (connectionStatus === "connected") {
      disconnect();
    }
  };

  return (
    <div className="h-screen w-72 shrink-0 p-5">
      <div className="flex h-full flex-col overflow-y-auto rounded-lg bg-card px-3 py-5 shadow-lg">
        <h2 className="mb-5 border-b border-border pb-2 text-lg font-semibold text-accent-foreground">
          Connection Info
        </h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Status:</p>
            {renderStatusBadge()}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Port:</p>
            <Badge variant="secondary">{selectedPort || "none"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Baundrate:</p>
            <Badge variant="secondary">115200 </Badge>
          </div>
          {/* <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Last Activity:</p>
            <Badge variant="secondary">5m ago</Badge>
          </div> */}
          <Button
            className="!mt-20 w-full"
            variant={connectionStatus === "connected" ? "destructive" : "default"}
            onClick={connectionStatus === "connected" ? disconnect : connectToPort}
            disabled={connectionStatus === "loading" || listStatus === "loading" || !selectedPort}
          >
            {connectionStatus === "loading"
              ? "Connecting"
              : connectionStatus === "connected"
                ? "Disconnect"
                : "Connect"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRefresh}
            disabled={connectionStatus !== "connected"}
          >
            Refresh
          </Button>
          <div className="flex items-center gap-x-2">
            <Button variant="ghost" disabled={connectionStatus === "connected"} onClick={getAllPorts}>
              <RefreshCwIcon />
            </Button>
            <select
              onChange={(e) => setSelectedPort(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 focus-within:outline-none"
              disabled={connectionStatus === "connected"}
            >
              <option disabled selected>
                select port
              </option>
              {ports.map((port, index) => (
                <option key={index} value={port.path}>
                  {port.path}
                </option>
              ))}
            </select>
          </div>
        </div>
        <PerformanceIndicator
          value={+data.DPOWER.TXPOWER}
          isConnected={connectionStatus === "connected"}
          onConnectionLost={handleConnectionLost} // ارسال تابع برای مدیریت قطع ارتباط
          className="mx-auto mt-10"
        />{" "}
        <div className="mt-0 space-y-5 text-center text-sm text-muted-foreground">Output Power (dbm)</div>
        <ExitButton />
      </div>
    </div>
  );
};

export default DeviceStatus;