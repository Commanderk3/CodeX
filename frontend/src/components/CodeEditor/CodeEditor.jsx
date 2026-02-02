import Editor from "@monaco-editor/react";
import "./CodeEditor.css";
import { useTheme } from "../../contexts/ThemeContext";

const CodeEditor = ({
  question,
  currCode,
  setCurrCode,
  language,
  setLanguage,
  handleSubmit,
  runTests,
}) => {
  const { isDark } = useTheme();
  return (
    <div className="code-editor-container">
      <div className="editor-toolbar flex flex-wrap justify-between items-center gap-2">
        {/* Language Dropdown */}
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-outline btn-sm">
            {language.toUpperCase()}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40"
          >
            {["javascript", "python", "java", "c++"].map((lang) => (
              <li key={lang}>
                <button
                  onClick={() => {
                    setLanguage(lang);
                    setCurrCode(question.boilerplate[lang]);
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline btn-accent"
            onClick={runTests}
          >
            Run
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="editor-wrapper">
        <Editor
          height="100%"
          width="100%"
          language={language}
          theme={isDark ? "vs-dark" : "vs"}
          value={currCode}
          onChange={(value) => setCurrCode(value)}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
