package com.refactotodolist.auth.model;

// Identité extraite du JWT par RequireAuthInterceptor
public record AuthContext(String userId, String email, String role) {

    public static final String REQUEST_ATTRIBUTE = "auth";
}
