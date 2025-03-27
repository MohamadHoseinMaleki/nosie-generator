import { cn } from "@renderer/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import PazhanLogo from "../../assets/Pazhan_Logo.png";

const Sidebar = (): JSX.Element => {
  
  const navbarItems = useMemo(
    () => [
      {
        label: "Single Tone",
        href: "/single-tone",
      },
      {
        label: "Multi Tone",
        href: "/multi-tone",
      },
      {
        label: "Sweep",
        href: "/sweep",
      },
      {
        label: "Barrage",
        href: "/barrage",
      },
      {
        label: "Filtered Noise",
        href: "/filtered-noise",
      },
      {
        label: "Repeater",
        href: "/delay-doppler",
      },
    ],
    [],
  );
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const checkHeight = () => {
      setShowLogo(window.innerHeight >= 676);
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);

    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  return (
    <div className="flex h-screen w-64 shrink-0 flex-col bg-gradient-to-t from-accent-foreground from-10% to-primary px-3 py-5 ring lg:w-64 md:w-56 sm:w-full">
      <h2 className="text-2xl font-bold text-accent">Noise Generator</h2>
      <div className="mt-20 space-y-5">
        {navbarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "block rounded-md px-3 py-2 text-lg text-accent transition-colors hover:bg-primary-foreground/20",
                isActive && "pointer-events-none bg-primary-foreground/30"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto">
        {showLogo && (
         <div className="mt-auto">
         {showLogo && (
           <img
             src={PazhanLogo}
             alt="Logo"
             className="w-full max-w-[220px] mx-auto scale-110 rounded-lg opacity-88 sm:max-w-[184px] -mt-5"
           />
         )}
       </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
