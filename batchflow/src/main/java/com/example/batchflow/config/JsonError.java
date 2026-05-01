package com.example.batchflow.config;

import java.time.Instant;

final class JsonError {

    private JsonError() {}

    static String build(Instant timestamp, int status, String error, String message, String path) {
        return "{"
                + "\"timestamp\":\"" + timestamp + "\","
                + "\"status\":" + status + ","
                + "\"error\":\"" + esc(error) + "\","
                + "\"message\":\"" + esc(message) + "\","
                + "\"path\":\"" + esc(path) + "\""
                + "}";
    }

    private static String esc(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder(s.length() + 8);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        return sb.toString();
    }
}
