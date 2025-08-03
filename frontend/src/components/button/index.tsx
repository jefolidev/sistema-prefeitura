import { ButtonProps } from "./types";

export function Button({className = "",
    disabled = false,
    icon,
    label,
    loading = false,
    type = "button",
    color,
    variant,
    onClick,}: ButtonProps) {

    return (
        <button
            className={`${variant === "outline" ? "btn-outline-primary" : ""} btn btn-${color} ${className}`}
            disabled={disabled || loading}
            type={type}
            
            onClick={onClick}
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
                <>
                    {icon && <span className="me-2">{icon}</span>}
                    {label}
                </>
            )}
        </button>
    );

}