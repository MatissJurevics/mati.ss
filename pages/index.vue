<template>
  <div class="azuki-container">
    <!-- Header section similar to Azuki -->
    <div class="header-section">
      <div class="made-with">
        Made with <span class="text-red-600">LOVE</span>
      </div>
      <div class="header-info">
        <div class="header-item">
          <div class="header-label">Title ·</div>
          <div>Matiss</div>
        </div>
        <div class="header-item">
          <div class="header-label">Date ·</div>
          <div>{{ currentDate }}</div>
        </div>
        <div class="header-item">
          <div class="header-label">Time ·</div>
          <div>{{ currentTime }}</div>
        </div>
        <div class="header-item">
          <div class="header-label">Position ·</div>
          <div>Software Engineer</div>
        </div>
      </div>
    </div>

    <!-- Main content section -->
    <div class="main-content">
      <div class="azuki-text">
        <div class="typing-container">
          <div class="hello-text" ref="helloTextRef"></div>
          <!-- Split Matiss into two parts for animation -->
          <div class="matiss-container">
            <span class="matiss-prefix" ref="matissPrefixRef"></span>
            <!-- Dot will appear here -->
            <div 
              class="cursor-dot-final" 
              :class="{'cursor-dot-visible': phase === 'final'}"
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="6" fill="#dc2626" />
              </svg>
            </div>
            <span 
              class="matiss-suffix" 
              ref="matissSuffixRef"
              :class="{'matiss-suffix-moved': phase === 'final'}"
            ></span>
          </div>
          
          <!-- SVG Cursor - only visible during typing -->
          <div 
            v-if="phase !== 'final'"
            class="cursor-container" 
            :class="{ 
              'cursor-hello': phase === 'hello', 
              'cursor-matiss': phase === 'matiss',
              'cursor-finished': phase === 'finished',
              'compress': cursorCompressed
            }"
          >
            <svg 
              v-if="(phase !== 'finished')"
              :width="phase === 'matiss' ? 24 : 12" 
              :height="phase === 'matiss' ? 40 : 20" 
              viewBox="0 0 12 40" 
              preserveAspectRatio="none"
              class="cursor-svg"
            >
              <line 
                x1="6" y1="0" x2="6" y2="40" 
                stroke-width="2" 
                stroke="currentColor" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer section -->
    <div class="footer-section">
      <div class="redesign">
        <span>Contact · <span class="underline cursor-pointer" @click="copyToClipboard('im@mati.ss')" title="Click to copy">im@mati.ss</span></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.azuki-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f0;
  font-family: 'Helvetica', sans-serif;
  color: #000;
}

.header-section {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  font-size: 0.8rem;
}

.header-info {
  display: flex;
  gap: 1.5rem;
}

.header-item {
  display: flex;
  gap: 0.25rem;
}

.header-label {
  color: #555;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.azuki-text {
  font-weight: 900;
  line-height: 1;
  position: relative;
  text-align: center;
}

.typing-container {
  display: inline-block;
  font-family: 'Georgia', 'Times New Roman', serif;
  position: relative;
}

.hello-text {
  font-size: 2rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.matiss-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}

.matiss-prefix, .matiss-suffix {
  font-size: 6rem;
  color: #dc2626;
  text-transform: uppercase;
  line-height: 1;
}

.matiss-suffix {
  transition: transform 0.8s ease;
}

.matiss-suffix-moved {
  transform: translateX(18px);
}

/* Cursor dot that appears between MATI and SS */
.cursor-dot-final {
  width: 12px;
  height: 12px;
  opacity: 0;
  position: absolute;
  right: -24px; /* Start position - right of the text */
  bottom: 12px; /* Align with text baseline */
  transition: opacity 0.3s ease, right 0.6s ease;
}

.cursor-dot-visible {
  opacity: 1;
  right: calc(4rem + 26px); /* Final position between MATI and SS */
}

.cursor-container {
  display: inline-block;    
  position: absolute;
  animation: blink 1s infinite;
}

.cursor-hello {
  color: #555;
  top: 0;
  right: -1rem;
  height: 32px;
}

.cursor-matiss {
  color: #dc2626;
  bottom: 0;
  right: -2rem;
  height: 80px;
  /* Align with text baseline */
  transform: translateY(-12px);
}

.cursor-finished {
  animation: none;
  bottom: 12px;
  right: -24px; /* Match the starting position of dot */
  height: 40px; /* Start with line height */
  width: 2px; /* Line width */
  transition: height 0.3s ease, width 0.3s ease, background-color 0.3s ease;
  background-color: #dc2626; /* Keep the red color throughout transition */
}

.cursor-finished.compress {
  height: 12px; /* Compress to dot height */
  width: 12px; /* Expand to dot width */
  border-radius: 50%;
  background-color: #dc2626;
}

/* Hide the SVG when compressing to prevent flicker */
.cursor-finished.compress .cursor-svg {
  display: none;
}

.cursor-svg {
  height: 100%;
}

.cursor-dot {
  height: 100%;
  width: 100%;
}

/* Animation for cursor-to-dot transition */
@keyframes appear {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.cursor-finished svg {
  animation: appear 0.5s ease forwards;
}

.footer-section {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  font-size: 0.8rem;
}

.made-with, .redesign {
  font-size: 0.8rem;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Responsive styling */
@media (max-width: 768px) {
  .hello-text {
    font-size: 1.5rem;
  }
  
  .matiss-prefix, .matiss-suffix {
    font-size: 4rem;
  }
  
  .matiss-suffix-moved {
    transform: translateX(12px);
  }
  
  .cursor-dot-final {
    width: 10px;
    height: 10px;
    transform: translateY(-10px);
  }
  
  .cursor-hello {
    height: 24px;
    right: -0.75rem;
  }
  
  .cursor-matiss {
    height: 40px;
    right: -1.5rem;
    transform: translateY(-8px);
  }
  
  .cursor-finished {
    height: 10px; /* Smaller dot for mobile */
    width: 10px;
    right: -1.5rem;
    transform: translateY(-8px);
  }

  .cursor-dot-visible {
    right: calc(4rem + 12px); /* Final position between MATI and SS */
  }
  
  .header-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

<script setup>
import { ref, onMounted } from 'vue';

const helloText = "Hello, I'm";
const matissPrefix = "MATI"; // First part of Matiss
const matissSuffix = "SS";   // Second part of Matiss
const helloTextRef = ref(null);
const matissPrefixRef = ref(null);
const matissSuffixRef = ref(null);
const currentDate = ref('');
const currentTime = ref('');
const phase = ref('hello');
const cursorCompressed = ref(false);

onMounted(() => {
  // Format date in the Azuki style: DD.MM.YYYY
  const now = new Date();
  currentDate.value = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.');
  
  // Format time: HH:MM:SS AM
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  // Enhanced typing animation with split text
  if (helloTextRef.value && matissPrefixRef.value && matissSuffixRef.value) {
    let helloIndex = 0;
    let matissIndex = 0;
    let typingInterval;
    
    const startTyping = () => {
      typingInterval = setInterval(() => {
        if (phase.value === 'hello') {
          if (helloIndex < helloText.length) {
            helloTextRef.value.textContent = helloText.substring(0, helloIndex + 1);
            helloIndex++;
          } else {
            // Move the cursor to the Matiss position
            phase.value = 'matiss';
            clearInterval(typingInterval);
            startTyping(); // Start typing Matiss immediately
          }
        } else if (phase.value === 'matiss') {
          // Type the full "MATISS" combined text
          const fullMatiss = matissPrefix + matissSuffix;
          
          if (matissIndex < fullMatiss.length) {
            // Split the typing between prefix and suffix
            if (matissIndex < matissPrefix.length) {
              matissPrefixRef.value.textContent = fullMatiss.substring(0, matissIndex + 1);
            } else {
              matissPrefixRef.value.textContent = matissPrefix;
              matissSuffixRef.value.textContent = fullMatiss.substring(matissPrefix.length, matissIndex + 1);
            }
            matissIndex++;
          } else {
            clearInterval(typingInterval);
            
            // First change to finished state (cursor becomes dot)
            phase.value = 'finished';
            
            // After a delay, compress the cursor into a dot
            setTimeout(() => {
              cursorCompressed.value = true;
              
              // After compression, move to final state (dot moves between MATI and SS)
              setTimeout(() => {
                phase.value = 'final';
              }, 600); // Delay before dot moves
            }, 500); // Delay before compression
          }
        }
      }, 150);
    };
    
    // Start the animation
    startTyping();
  }
});

setInterval(() => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}, 1000);
</script>