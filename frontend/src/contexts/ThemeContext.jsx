import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// daisyui themes
const lightMode = "lofi";
const darkMode = "sunset";

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") !== lightMode
  );

  if (isDark === undefined) {
    setIsDark(lightMode);
  }

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? darkMode : lightMode,
    );
    localStorage.setItem("theme", isDark ? darkMode : lightMode);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
