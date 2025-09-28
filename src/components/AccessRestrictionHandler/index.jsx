// src/components/AccessRestrictionHandler.jsx

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

  const currentTier = useMemo(() => {
    return userTier || localStorage.getItem("user-tier") || "guest";
  }, [userTier]);

  const hasAccess = allowedTiers.includes(currentTier);

  if (!hasAccess && redirectTo) {
    console.warn(`🔐 Access denied for tier '${currentTier}'. Redirecting to: ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  if (!hasAccess) {
    console.warn(`🔐 Access denied for tier '${currentTier}'. Upgrade required: ${allowedTiers.join(" / ")}`);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-3">🚫 Access Restricted</h2>
          <p className="mb-2">
            Your current plan <strong>{currentTier}</strong> does not have access to this feature.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upgrade to <strong>{allowedTiers.join(" / ")}</strong> to unlock this functionality.
          </p>
          <button
            onClick={() => navigate("/upgrade")}
            className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded transition"
          >
            Upgrade Plan
          </button>
        </div>
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
