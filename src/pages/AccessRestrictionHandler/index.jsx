import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Navigate, useNavigate } from "react-router-dom";

export default function AccessRestrictionHandler({
  allowedTiers = [],
  userTier,
  children,
  redirectTo = null,
}) {
  const navigate = useNavigate();

  const currentTier = useMemo(
    () => userTier || localStorage.getItem("user-tier") || "guest",
    [userTier]
  );

  const hasAccess = allowedTiers.includes(currentTier);

  if (!hasAccess && redirectTo) return <Navigate to={redirectTo} replace />;

  if (!hasAccess) {
    return (
      <div className="access-denied-container">
        <h2>🚫 Access Restricted</h2>
        <p>
          Your current plan <strong>({currentTier})</strong> does not have access to this
          feature.
        </p>
        <p>
          Please upgrade to <strong>{allowedTiers.join(" / ")}</strong> to unlock this
          feature.
        </p>
        <button className="upgrade-btn" onClick={() => navigate("/upgrade")}>
          Upgrade Plan
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

AccessRestrictionHandler.propTypes = {
  allowedTiers: PropTypes.arrayOf(PropTypes.string).isRequired,
  userTier: PropTypes.string,
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};
