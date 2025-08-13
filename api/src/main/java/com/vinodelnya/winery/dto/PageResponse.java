package com.vinodelnya.winery.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class PageResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int size;
    private boolean first;
    private boolean last;
    private Map<String, BigDecimal> pageTotal;
    private Map<String, BigDecimal> grandTotal;
    
    public PageResponse() {}
    
    public PageResponse(List<T> content, long totalElements, int totalPages, 
                       int currentPage, int size, boolean first, boolean last) {
        this.content = content;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.size = size;
        this.first = first;
        this.last = last;
    }
}