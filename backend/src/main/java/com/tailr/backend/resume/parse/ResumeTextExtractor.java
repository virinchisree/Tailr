package com.tailr.backend.resume.parse;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;

@Component
public class ResumeTextExtractor {
    static final int MAX_PAGES = 10; // Limit pages
    static final int MAX_CHARS = 10000; // Limit words
    static final int MIN_WORDS = 30; // Minimum words

    private static final byte[] PDF_MAGIC = { '%', 'P', 'D', 'F' };
    private static final byte[] ZIP_MAGIC = { 'P', 'K', 3, 4 }; // Docx starts with PK.. ZIP format

    static {
        // zip-bomb guards for .docx
        ZipSecureFile.setMinInflateRatio(0.01);
        ZipSecureFile.setMaxEntrySize(20L * 1024 * 1024);
    }

    public String extract(byte[] bytes) {
        String raw;
        if (startsWith(bytes, PDF_MAGIC)) {
            raw = fromPdf(bytes);
        } else if (startsWith(bytes, ZIP_MAGIC)) {
            raw = fromDocx(bytes);
        } else {
            throw new ResumeParseException("Upload a PDF or DOCX file. Older .doc files aren't supported.");
        }

        String text = normalize(raw);
        if (wordCount(text) < MIN_WORDS) {
            throw new ResumeParseException(
                    "We couldn't read text from this file. If it's a scanned PDF, paste the text instead.");
        }
        if (text.length() > MAX_CHARS) {
            throw new ResumeParseException("This resume is too long. Keep it under about 3,000 words.");
        }
        return text;
    }

    private String fromPdf(byte[] bytes) {
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            if (doc.getNumberOfPages() > MAX_PAGES) {
                throw new ResumeParseException("Resumes over" + MAX_PAGES + "pages aren't supported");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true); // keeps two-column layouts in order
            return stripper.getText(doc);
        } catch (InvalidPasswordException e) {
            throw new ResumeParseException("PDF is password-protected. Remove the password and try again.");
        } catch (IOException e) {
            throw new ResumeParseException("Could not read PDF file. Please try again.");
        }
    }

    private String fromDocx(byte[] bytes) {
        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
                XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        } catch (IOException | RuntimeException e) {
            // POI throws runtime exceptions for non-Word zips and zip bombs
            throw new ResumeParseException("This file isn't a readable Word document.");
        }
    }

    static String normalize(String s) {
        return s.replace("\r\n", "\n").replace('\r', '\n')
                .replace('\u00A0', ' ') // non-breaking spaces
                .replaceAll("[\\p{Cntrl}&&[^\n\t]]", "") // stray control chars
                .replaceAll("[ \t]+\n", "\n") // trailing spaces
                .replaceAll("\n{3,}", "\n\n") // big gaps
                .strip();
    }

    private static int wordCount(String s) {
        return s.isBlank() ? 0 : s.split("\\s+").length;
    }

    private static boolean startsWith(byte[] bytes, byte[] magic) {
        return bytes.length >= magic.length && Arrays.equals(Arrays.copyOf(bytes, magic.length), magic);
    }
}