// 📄 src/components/AccessRestrictionHandler.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

/**
 * AccessRestrictionHandler
 *
 * Decides if a user may see `children` based on tier.
 * - Reads `userTier` prop first, then localStorage('user-tier'), else "guest".
 * - Normalizes tiers (trim + lowercase) so " Pro " equals "pro".
 * - Optional redirect with a return URL so you can send them back post-upgrade.
 * - Customizable denied UI (or provide your own via `renderDenied`).
 */
export default function AccessRestrictionHandler({
  allowedTiers = [],
  userTier,
  children,
  redirectTo = null,
  renderDenied, // optional: () => ReactNode
  onDenied, // optional: (info) => void
  rememberRedirectBack = true,
  upgradePath = "/upgrade", // used by default denied UI
  storageKey = "user-tier", // override if your storage key differs
  className = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const getSafeLocal = (key) => {
    try {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  // Normalize to lowercase & trimmed so comparisons are reliable.
  const normalize = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);

  const currentTier = useMemo(() => {
    const tier =
      userTier ??
      getSafeLocal(storageKey) ??
      "guest";
    return normalize(tier) || "guest";
  }, [userTier, storageKey]);

  const normalizedAllowed = useMemo(
    () => (Array.isArray(allowedTiers) ? allowedTiers.map(normalize) : []),
    [allowedTiers]
  );

  const hasAccess = normalizedAllowed.includes(currentTier);

  // Notify caller if access is denied (analytics, toast, etc.)
  if (!hasAccess && typeof onDenied === "function") {
    try {
      onDenied({ currentTier, allowedTiers: normalizedAllowed, path: location.pathname });
    } catch {/* no-op */}
  }

  // If a redirect target was provided, prefer redirect flow.
  if (!hasAccess && redirectTo) {
    // Keep "return to" info so your upgrade flow can bounce back.
    const state = rememberRedirectBack ? { from: location } : undefined;
    return <Navigate to={redirectTo} replace state={state} />;
  }

  // Otherwise render a small default "access denied" panel (or a custom one).
  if (!hasAccess) {
    if (typeof renderDenied === "function") {
      return <>{renderDenied({ currentTier, allowedTiers: normalizedAllowed, navigate })}</>;
    }

    return (
      <div
        className={
          [
            "mx-auto my-8 max-w-xl rounded-xl border border-white/10 bg-black/40 p-6 text-sm text-gray-200",
            "shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur",
            className,
          ].join(" ")
        }
        role="alert"
        aria-live="polite"
      >
        <h2 className="mb-2 text-base font-semibold text-white">🚫 Access Restricted</h2>
        <p className="mb-1">
          Your current plan <strong>({currentTier})</strong> doesn’t include this feature.
        </p>
        {normalizedAllowed.length > 0 && (
          <p className="mb-4">
            Required plan: <strong>{normalizedAllowed.join(" / ")}</strong>
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-white/15 px-3 py-1.5 hover:border-white/25"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={() =>
              rememberRedirectBack
                ? navigate(upgradePath, { state: { from: location } })
                : navigate(upgradePath)
            }
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 px-3 py-1.5 font-medium text-black hover:opacity-90"
          >
            Upgrade plan
          </button>
        </div>
      </div>
    );
  }

  // ✅ Allowed
  return <>{children}</>;
}

AccessRestrictionHandler.propTypes = {
  allowedTiers: PropTypes.arrayOf(PropTypes.string).isRequired,
  userTier: PropTypes.string,
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
  renderDenied: PropTypes.func,
  onDenied: PropTypes.func,
  rememberRedirectBack: PropTypes.bool,
  upgradePath: PropTypes.string,
  storageKey: PropTypes.string,
  className: PropTypes.string,
};
