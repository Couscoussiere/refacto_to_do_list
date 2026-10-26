package com.refactotodolist.auth.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.refactotodolist.auth.middleware.RequireAuthInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;
    private final RequireAuthInterceptor requireAuth;

    public WebConfig(@Value("${app.cors-origin}") String corsOrigin, RequireAuthInterceptor requireAuth) {
        this.allowedOrigins = Arrays.stream(corsOrigin.split(",")).map(String::trim).toArray(String[]::new);
        this.requireAuth = requireAuth;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "HEAD", "PUT", "PATCH", "POST", "DELETE")
                .allowedHeaders("*");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requireAuth).addPathPatterns("/v1/auth/me");
    }
}
