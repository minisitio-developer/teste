import { useState } from "react";

function SafeMosaico({ src, alt, fallback }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <>
      {!error && (
        <img
          src={src}
          alt={alt}
          style={{ display: loaded ? "block" : "none" }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {error && fallback && (
        <img src={fallback} alt="fallback" style={{ display: "block" }} />
      )}

    </>
  );
}


export default SafeMosaico;