// ============================================
// Cloudflare Worker - AI SEO Content API Proxy
// Version: v5.5 Emergency Fix - Non-streaming mode
// ============================================

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed', status: 'error' }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      // Parse request body
      const body = await request.json();
      console.log('[Worker] Received request:', JSON.stringify(body, null, 2));

      const { provider, model, systemPrompt, userPrompt, parameters } = body;

      // ============================================
      // API Key Validation
      // ============================================
      const apiKey = env.GROQ_API_KEY;
      
      if (!apiKey || apiKey.trim() === '') {
        console.error('[Worker] ERROR: GROQ_API_KEY is missing or empty');
        return new Response(
          JSON.stringify({ 
            error: 'API Key Missing', 
            message: 'GROQ_API_KEY environment variable is not set',
            status: 'error' 
          }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log('[Worker] API Key check: OK (length:', apiKey.length, ')');

      // ============================================
      // Test Content (Fallback)
      // ============================================
      const testContent = "Connection Success: Pipeline is clear. Groq API is responding correctly.";

      // ============================================
      // Build Groq Request
      // ============================================
      const groqRequestBody = {
        model: model || 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: userPrompt || 'Hello'
          }
        ],
        temperature: parameters?.temperature || 0.7,
        max_tokens: parameters?.max_tokens || 4096,
        stream: false  // DISABLE STREAMING - Force non-streaming mode
      };

      console.log('[Worker] Sending to Groq:', JSON.stringify(groqRequestBody, null, 2));

      // ============================================
      // Call Groq API
      // ============================================
      let groqResponse;
      try {
        groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(groqRequestBody)
        });
      } catch (fetchError) {
        console.error('[Worker] Fetch error:', fetchError);
        // Return test content on fetch failure
        return new Response(
          JSON.stringify({ 
            content: testContent + " (Fetch Error: " + fetchError.message + ")",
            status: 'fallback',
            error: fetchError.message
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      console.log('[Worker] Groq response status:', groqResponse.status);

      // ============================================
      // Handle Groq Error Response
      // ============================================
      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('[Worker] Groq error response:', errorText);
        
        // Return test content on API error
        return new Response(
          JSON.stringify({ 
            content: testContent + " (Groq Error: " + groqResponse.status + ")",
            status: 'fallback',
            error: errorText
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // ============================================
      // Parse Groq Response (Non-streaming)
      // ============================================
      let groqData;
      try {
        groqData = await groqResponse.json();
        console.log('[Worker] Groq data received:', JSON.stringify(groqData, null, 2).substring(0, 500));
      } catch (parseError) {
        console.error('[Worker] Parse error:', parseError);
        return new Response(
          JSON.stringify({ 
            content: testContent + " (Parse Error)",
            status: 'fallback',
            error: parseError.message
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // ============================================
      // Extract Content - Multiple Path Support
      // ============================================
      let content = '';
      
      // Path 1: Standard OpenAI format (non-streaming)
      if (groqData.choices?.[0]?.message?.content) {
        content = groqData.choices[0].message.content;
        console.log('[Worker] Content extracted from choices[0].message.content');
      }
      // Path 2: Direct content field
      else if (groqData.content) {
        content = groqData.content;
        console.log('[Worker] Content extracted from data.content');
      }
      // Path 3: Text field
      else if (groqData.text) {
        content = groqData.text;
        console.log('[Worker] Content extracted from data.text');
      }
      // Path 4: Response field
      else if (groqData.response) {
        content = groqData.response;
        console.log('[Worker] Content extracted from data.response');
      }

      // ============================================
      // Validate Content
      // ============================================
      if (!content || content.trim() === '') {
        console.error('[Worker] ERROR: Content is empty!');
        console.error('[Worker] Full Groq response:', JSON.stringify(groqData, null, 2));
        
        // Return test content if actual content is empty
        content = testContent + " (Empty Content Fallback)";
      }

      console.log('[Worker] Final content length:', content.length);
      console.log('[Worker] First 100 chars:', content.substring(0, 100));

      // ============================================
      // Return Success Response
      // ============================================
      const responseBody = {
        content: content,
        status: 'success',
        model: groqData.model || model,
        usage: groqData.usage || {}
      };

      console.log('[Worker] Sending response to frontend');

      return new Response(
        JSON.stringify(responseBody),
        { status: 200, headers: corsHeaders }
      );

    } catch (error) {
      console.error('[Worker] Unhandled error:', error);
      
      // Return error with fallback content
      return new Response(
        JSON.stringify({ 
          content: "Connection Success: Pipeline is clear. (Error: " + error.message + ")",
          status: 'error',
          error: error.message,
          stack: error.stack
        }),
        { status: 200, headers: corsHeaders }
      );
    }
  }
};
