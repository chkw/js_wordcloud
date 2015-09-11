# SEPT 2015 chrisw
# Package up word cloud scripts into one file.

BOWER_DIR = ../bower_components

SCRIPTS = $(BOWER_DIR)/d3/d3.js $(BOWER_DIR)/d3-cloud/d3.layout.cloud.js $(BOWER_DIR)/underscore/underscore.js utils.js word_clouder.js

TARGETS = word_clouder_plugin.js

CLOSURE_COMPILER_JAR = ~/git/closure-compiler/build/compiler.jar
#COMPILATION_LEVEL = WHITESPACE_ONLY
COMPILATION_LEVEL = SIMPLE_OPTIMIZATIONS
#COMPILATION_LEVEL = ADVANCED_OPTIMIZATIONS

METEOR_PACKAGE_DIR = 

test:

bower_update:
	bower update ;
	\

bower_clean:
	rm -rf $(BOWER_DIR) ;
	\

sync_meteor: word_clouder_plugin_dev.js
	rsync -avP $< $(METEOR_PACKAGE_DIR)/word_clouder_plugin.js ;
	\

word_clouder_plugin.js: $(SCRIPTS)
	java -jar $(CLOSURE_COMPILER_JAR) --compilation_level $(COMPILATION_LEVEL) --js_output_file=$@ $(SCRIPTS) ;
	\

word_clouder_plugin_dev.js: $(SCRIPTS)
	rm -f 1.tmp ;
	\
	for script in $(SCRIPTS) ; do \
		cat $$script >> 1.tmp ; \
	done ;
	\
	mv 1.tmp $@ ;
	\
	rm -f 1.tmp ;
	\

clean:
	rm -f $(TARGETS)
