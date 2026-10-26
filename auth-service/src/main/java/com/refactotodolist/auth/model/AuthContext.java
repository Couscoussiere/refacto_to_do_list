package com.refactotodolist.auth.model;

// Équivalent de req.auth côté Node : identité extraite du JWT par le middleware
public record AuthContext(String userId, String email) {

    public static final String REQUEST_ATTRIBUTE = "auth";
}
