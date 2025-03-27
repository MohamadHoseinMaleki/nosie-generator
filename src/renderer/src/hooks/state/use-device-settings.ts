import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StoreType<T> {
  data: T;
  history: T[];
  onChange: (data: any) => void;
  onReset: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  setOnInitial: (type: string, attr: string) => void;
  updateField: (type: string, attr: string, value: any) => void;
}

const initial = {
  SINGLE: {
    FREQCY0: -20000000,
    ATTENV0: 255,
  },
  SWEEPF: {
    MINFREQ: 10000000,
    MAXFREQ: 20000000,
    STPFREQ: 100,
    SWPTIME: 0.00000001,
    ATTENVL: 255,
    REVERSE: 0,
  },
  MULTON: {
    FREQCY0: -20000000,
    FREQCY1: -10000000,
    FREQCY2: 0,
    FREQCY3: 10000000,
    FREQCY4: 20000000,
    ATTENV0: 255,
    ATTENV1: 255,
    ATTENV2: 255,
    ATTENV3: 255,
    ATTENV4: 255,
    MSELECT: 31,
  },
  FNOISE: {
    NOISEBW: 56000000,
    SHFFREQ: 10000000,
    SHFENBL: 0,
  },
  BARAGE: {
    BNUMBER: 32,
  },

  DELDOP: {
    DELAYEN: 1,
    DOPLREN: 0,
    DLYVALU: 1000,
    DOPFREQ: 1000000,
  },

  NOISES: {
    NOISESS: 0,
    PSGMODE: "0",
    ONDETER: 0,
    OFFDETR: 0,
    ONSTOCH: 0,
    OFFSTOC: 0,
  },
  LOFATT: {
    LOFRQCY: 1000000000,
    TXATTEN: 65,
  },

  DPOWER: {
    TXPOWER: 0,
  },
};

export type DeviceSettingType = typeof initial;

export const useDeviceSettings = create(
  persist<StoreType<typeof initial>>(
    (set, get) => ({
      data: initial,
      history: [initial, initial],

      onChange: (data) => {
        const { history } = get();
        set({ history, data });
      },

      onReset: () => {
        set({ data: initial, history: [initial, initial] });
      },

      onCancel: () => {
        const { history } = get();
        set({
          data: history[0],
        });
      },

      onSubmit: () => {
        const { data, history } = get();
        set({
          history: [history[1], data],
        });
      },

      // ✅ بازگرداندن مقدار `history[1]` به مقدار قبلی در صورت `Invalid Response`
      onInvalid: () => {
        const { history } = get();
        set({
          data: history[0],   // مقدار اینپوت‌ها را به مقدار سالم برگردان
          history: [history[0], history[0]], // مقدار `history[1]` نیز اصلاح شود
        });
      },

      setOnInitial: (type, attr) => {
        set((state) => ({
          data: {
            ...state.data,
            [type]: {
              [attr]: initial[type][attr],
            },
          },
        }));
      },
      updateField: (type, attr, value) => {
        set((state) => ({
          data: { ...state.data, [type]: { ...state.data[type], [attr]: value } },
        }));
      },
    }),
    {
      name: "device-setting",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
