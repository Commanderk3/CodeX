import Editor from "@monaco-editor/react";
import "./CodeEditor.css";

const CodeEditor = ({
  question,
  currCode,
  setCurrCode,
  language,
  setLanguage,
}) => {
  return (
    <div className="code-editor-container">
      <div className="editor-toolbar">
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setCurrCode(question.boilerplate[e.target.value]);
          }}
          className="language-selector"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c++">C++</option>
        </select>
      </div>
      <div className="editor-wrapper">
        <Editor
          height="100%"
          width="100%"
          language={language}
          theme="vs-light"
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
