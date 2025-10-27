package com.synvia.core.exception;

/**
 * Exceção lançada quando não há estoque suficiente para um produto.
 */
public class EstoqueInsuficienteException extends RuntimeException {
    
    public EstoqueInsuficienteException(String message) {
        super(message);
    }
    
    public EstoqueInsuficienteException(String message, Throwable cause) {
        super(message, cause);
    }
}