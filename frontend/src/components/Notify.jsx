import { useEffect, useRef } from "react";
import { useSystemMessages } from "../contexts/SystemMessageContext";

export const Notify = () => {
  const { messages, clearMessage } = useSystemMessages();

  const timeoutRefs = useRef({});

  useEffect(() => {
    messages.forEach((msg) => {
      if (!timeoutRefs.current[msg.id]) {
        timeoutRefs.current[msg.id] = setTimeout(() => {
          clearMessage(msg.id);
          delete timeoutRefs.current[msg.id];
        }, 5000);
      }
    });
  }, [messages, clearMessage]);

  function cookMessage(id, type, message) {
    console.log(type, message);
    // FIXED: Success alert now uses correct styling
    if (type === "success") {
      return (
        <div key={id} role="alert" className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message}</span> {/* FIXED: Now uses actual message */}
        </div>
      );
    }

    // Rest of the cookMessage function remains the same...
    if (type === "warning") {
      return (
        <div key={id} role="alert" className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{message}</span>
        </div>
      );
    } else if (type === "alert") {
      return (
        <div key={id} role="alert" className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{message}</span>
        </div>
      );
    } else if (type === "info") {
      return (
        <div key={id} role="alert" className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{message}</span>
        </div>
      );
    } else if (type === "error") {
      return (
        <div key={id} role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message}</span>
        </div>
      );
    }
  }

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50">
      {messages.map((msg) => cookMessage(msg.id, msg.type, msg.message))}
    </div>
  );
};
