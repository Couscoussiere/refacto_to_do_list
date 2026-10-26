package com.refactotodolist.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @EventListener
    public void onStarted(WebServerInitializedEvent event) {
        System.out.println("serveur demarré sur le port : " + event.getWebServer().getPort());
    }
}
