package com.tailr.backend.match;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest(MatchController.class)
class MatchControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private MatchService matchService;

    @Test
    void rejectsEmptyResume() throws Exception {
        mvc.perform(post("/api/match")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"resumeText\":\"\",\"jobDescription\":\"Java\"}"))
                .andExpect(status().isBadRequest());
    }
}
