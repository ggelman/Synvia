package com.synvia.core.dto;

import java.time.LocalDateTime;

public class SalesDataDTO {
    private LocalDateTime ds;
    private int y;
    private String itemName;

    public SalesDataDTO(LocalDateTime ds, int y, String itemName) {
        this.ds = ds;
        this.y = y;
        this.itemName = itemName;
    }

    // Getters and setters
    public LocalDateTime getDs() {
        return ds;
    }

    public void setDs(LocalDateTime ds) {
        this.ds = ds;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
}
