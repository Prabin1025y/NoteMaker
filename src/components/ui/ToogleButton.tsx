import { Dispatch, SetStateAction } from "react";

const ToogleButton = ({
    setDesignEnabled,
    designEnabled,
    className,
}: {
    setDesignEnabled: Dispatch<SetStateAction<boolean>>;
    designEnabled: boolean;
    className?: string;
}) => {
    return (
        <label
            className={`${className} relative inline-flex items-center cursor-pointer text-[1em]`}
        >
            <input
                onChange={(e) => setDesignEnabled(e.target.checked)}
                checked={designEnabled}
                type="checkbox"
                className="sr-only peer"
            />

            <div
                className={`
                    ${designEnabled ? "bg-emerald-500 after:translate-x-[1.7em] after:content-['✔️']" : "bg-rose-400 after:content-['✖️']"}
      relative
      w-[3.5em] h-[1.8em]
      
      rounded-full
      shadow-md
      transition-colors duration-300


      
      after:absolute
      after:top-[0.15em]
      after:left-[0.15em]
      after:w-[1.5em]
      after:h-[1.5em]
      after:flex
      after:items-center
      after:justify-center
      after:rounded-full
      after:bg-gray-50
      after:transition-all
      after:duration-300
      after:shadow

      peer-hover:after:scale-95
      active:after:scale-90
    `}
            />
        </label>
    );
};

export default ToogleButton;
