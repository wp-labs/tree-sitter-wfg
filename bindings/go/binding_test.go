package tree_sitter_wfg_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-wfg"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_wfg.Language())
	if language == nil {
		t.Errorf("Error loading Wfg grammar")
	}
}
