// This source code file is AUTO-GENERATED by github.com/taskcluster/jsonschema2go

package tcsecrets

import (
	"encoding/json"

	tcclient "github.com/taskcluster/taskcluster/v31/clients/client-go"
)

type (
	// Message containing a Taskcluster Secret
	Secret struct {

		// An expiration date for this secret.
		Expires tcclient.Time `json:"expires"`

		// The secret value to be encrypted.
		//
		// Additional properties allowed
		Secret json.RawMessage `json:"secret"`
	}

	// Message containing a list of secret names
	SecretsList struct {

		// Opaque `continuationToken` to be given as query-string option to get the
		// next set of provisioners.
		// This property is only present if another request is necessary to fetch all
		// results. In practice the next request with a `continuationToken` may not
		// return additional results, but it can. Thus, you can only be sure to have
		// all the results if you've called with `continuationToken` until you get a
		// result without a `continuationToken`.
		ContinuationToken string `json:"continuationToken,omitempty"`

		// Secret names
		//
		// Array items:
		// Secret name
		Secrets []string `json:"secrets"`
	}
)
