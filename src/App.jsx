import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [response, setResponse] = useState(""); // caso de estudio
  const [audit, setAudit] = useState(""); // auditoría del asistente
  const [userAnswer, setUserAnswer] = useState(""); // respuesta del usuario
  const [comparison, setComparison] = useState(""); // comparación final

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

  const send = async (prompt, tool) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    if (tool === "usecase") {
      setResponse(text);
      setAudit(""); // limpiar anteriores
      setComparison("");
    } else if (tool === "audit") {
      setAudit(text);
    } else if (tool === "compare") {
      setComparison(text);
    }
  };

  const handleCompare = async () => {
    // Paso 1: generar auditoría del asistente
    await send(
      `Realiza una auditoría para este caso de estudio basado en la norma ISO 27001: ${response}`,
      "audit"
    );

    // Paso 2: comparar la respuesta del usuario con la del asistente
    await send(
      `Compara esta auditoría del asistente: ${audit} con esta respuesta del usuario: ${userAnswer}. Resume diferencias, coincidencias y da retroalimentación.`,
      "compare"
    );
  };

  return (
    <div className="container">
      <header>
        <h1>🛡️ Asistente ISO 27000</h1>
        <p>
          Esta herramienta permite generar casos de estudio para practicar
          auditorías internas basadas en la norma ISO/IEC 27001, facilitando el
          aprendizaje en entornos simulados.
        </p>
      </header>

      <section className="card">
        <h2>📄 Generar caso de estudio</h2>
        <button
          onClick={() =>
            send(
              `Genera un caso de estudio ficticio y realista para practicar una auditoría ISO/IEC 27001. Describe de forma breve: el nombre de la empresa, sector, tamaño, ubicación, contexto organizacional, estructura de TI, activos de información críticos, partes interesadas, procesos clave y una breve descripción del SGSI. Mantén el caso corto y directo. No realices la auditoría ni incluyas hallazgos.`,
              "usecase"
            )
          }
        >
          Generar
        </button>
        <div className="markdown-container">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      </section>

      <section className="card">
        <h2>📝 Compara tu auditoría con la del asistente</h2>
        <textarea
          rows="6"
          placeholder="Escribe aquí tu auditoría basada en el caso generado..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        <button onClick={handleCompare}>Comparar</button>

        {audit && (
          <>
            <h3>🔍 Auditoría del asistente</h3>
            <div className="markdown-container">
              <ReactMarkdown>{audit}</ReactMarkdown>
            </div>
          </>
        )}

        {comparison && (
          <>
            <h3>📊 Comparación</h3>
            <div className="markdown-container">
              <ReactMarkdown>{comparison}</ReactMarkdown>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default App;
