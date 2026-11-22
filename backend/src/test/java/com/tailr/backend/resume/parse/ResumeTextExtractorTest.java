package com.tailr.backend.resume.parse;

import static org.assertj.core.api.Assertions.*;

import java.io.ByteArrayOutputStream;

import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;

class ResumeTextExtractorTest {

    private final ResumeTextExtractor extractor = new ResumeTextExtractor();
    private static final String LINE = "Java developer with Spring Boot React PostgreSQL Docker REST APIs microservices experience";

    @Test
    void readsPdf() throws Exception {
        assertThat(extractor.extract(pdf(LINE + " " + LINE + " " + LINE))).contains("Spring Boot");
    }

    @Test
    void readsDocx() throws Exception {
        assertThat(extractor.extract(docx(LINE + " " + LINE + " " + LINE))).contains("PostgreSQL");
    }

    @Test
    void rejectsUnknownFormat() {
        assertThatThrownBy(() -> extractor.extract("hello".getBytes()))
                .isInstanceOf(ResumeParseException.class).hasMessageContaining("PDF or DOCX");
    }

    @Test
    void rejectsNearlyEmptyPdf() throws Exception {
        assertThatThrownBy(() -> extractor.extract(pdf("Just a name")))
                .hasMessageContaining("scanned");
    }

    private static byte[] pdf(String text) throws Exception {
        try (PDDocument doc = new PDDocument(); var out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (var cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
                cs.newLineAtOffset(20, 700);
                cs.showText(text);
                cs.endText();
            }
            doc.save(out);
            return out.toByteArray();
        }
    }

    private static byte[] docx(String text) throws Exception {
        try (var doc = new XWPFDocument(); var out = new ByteArrayOutputStream()) {
            doc.createParagraph().createRun().setText(text);
            doc.write(out);
            return out.toByteArray();
        }
    }
}