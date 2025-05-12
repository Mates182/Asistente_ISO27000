import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [response, setResponse] = useState(""); // caso de estudio
  const [audit, setAudit] = useState(""); // auditoría del asistente
  const [userAnswer, setUserAnswer] = useState(""); // respuesta del usuario
  const [comparison, setComparison] = useState(""); // comparación final
  const [manualMode, setManualMode] = useState(false); // para alternar modo
  const [manualCase, setManualCase] = useState(""); // texto del caso de estudio manual
  const [execution, setExecution] = useState(""); // resultado de la ejecución de auditoría

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
    } else if (tool === "execution") {
      setExecution(text);
    }
  };

  const handleCompare = async () => {
    // Paso 1: generar auditoría del asistente
    await send(
      `Realiza una auditoría para este caso de estudio (Si no es una respuesta/caso de estudio coherente, menciona que debe ingresar un caso de estudio coherente para poder realizar la auditoria) basado en la norma ISO 27001: ${response}`,
      "audit"
    );

    // Paso 2: comparar la respuesta del usuario con la del asistente
    await send(
      `Compara esta auditoría del asistente (si no es una auditoría, notifícalo): ${audit} 
con esta respuesta del usuario (si no crees que es una respuesta válida, notifícalo): ${userAnswer}. 

Evalúa similitudes, diferencias, exactitud respecto a los controles y principios de la ISO 27001. 
Proporciona retroalimentación constructiva al usuario para mejorar su análisis.`,
      "compare"
    );
  };

  const handleExecution = async () => {
    const caseData = manualMode ? manualCase : response;

    await send(
      `Ejecuta la auditoría interna según la norma ISO/IEC 27001 para el siguiente caso de estudio (basado en la planificación): ${caseData}. Evalúa controles, verifica cumplimiento, encuentra hallazgos y proporciona conclusiones claras.`,
      "execution"
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
        <h2>Fase 1: Planificacion de la auditoria</h2>
        <h2>📄 Caso de estudio</h2>
        <div style={{ margin: "0 auto 1rem auto" }}>
          <button
            onClick={() => setManualMode(false)}
            style={{ width: "auto" }}
            className={`btn ${!manualMode ? "btn-success" : "btn-outline-success"}`}
          >
            Generar automáticamente
          </button>

          <button
            onClick={() => setManualMode(true)}
            className={`btn ${manualMode ? "btn-success" : "btn-outline-success"}`}
          >
            Escribir manualmente
          </button>
        </div>

        <button
          onClick={() =>
            send(
              `Genera un caso de estudio ficticio y realista para practicar una auditoría ISO/IEC 27001. Describe: 
- nombre de la empresa
- sector y ubicación
- tamaño de la organización
- contexto organizacional
- estructura de TI
- activos de información críticos
- partes interesadas
- procesos clave
- alcance del SGSI
- objetivos del SGSI
- riesgos identificados
- controles aplicados según ISO 27001 Anexo A

Este caso será utilizado para planificar y ejecutar una auditoría interna. No incluyas hallazgos ni resultados de auditoría.`,
              "usecase"
            )
          }
          disabled={manualMode}
          style={{display: manualMode? "none" : ""}}
        >
          Generar
        </button>
        {manualMode ? (
          <textarea
            rows="8"
            placeholder="Escribe tu propio caso de estudio aquí..."
            value={manualCase}
            onChange={(e) => setManualCase(e.target.value)}
          />
        ) : (
          <div className="markdown-container">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        )}
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
      <section className="card">
        <h2>🔧 Fase 2: Ejecución de la auditoría</h2>
        <p>
          Una vez planificada la auditoría y revisado el caso de estudio, puedes
          ejecutar la auditoría interna para obtener hallazgos y
          recomendaciones.
        </p>
        <button onClick={handleExecution}>Ejecutar auditoría</button>

        {execution && (
          <>
            <h3>📋 Resultado de la auditoría</h3>
            <div className="markdown-container">
              <ReactMarkdown>{execution}</ReactMarkdown>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default App;
