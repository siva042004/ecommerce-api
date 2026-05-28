package com.ecommerce.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ecommerce API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #0f172a;
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                }
                .card {
                    background: #1e293b;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.4);
                    max-width: 500px;
                }
                h1 {
                    color: #38bdf8;
                    margin-bottom: 10px;
                }
                p {
                    color: #cbd5e1;
                }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 20px;
                    background: #38bdf8;
                    color: #0f172a;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                }
                a:hover {
                    background: #0ea5e9;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🚀 Ecommerce API Live</h1>
                <p>Spring Boot + PostgreSQL + JWT Authentication</p>
                <p>API documentation available below</p>
                <a href="/swagger-ui/index.html">Open Swagger Docs</a>
            </div>
        </body>
        </html>
        """;
    }
}