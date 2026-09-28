import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="LAYR home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        Elvi<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
