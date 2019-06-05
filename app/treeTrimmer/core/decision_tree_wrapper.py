from typing import List

import numpy as np
from sklearn.metrics import confusion_matrix as skl_confusion_matrix
from sklearn.model_selection import cross_val_predict as skl_cross_val_predict
from sklearn.tree import DecisionTreeClassifier


class DecisionTreeWrapper:
    def __init__(self, **kwargs):
        assert ('data' and 'parameters' in kwargs)
        data, parameters = kwargs.get('data'), kwargs.get('parameters')
        self.feature_data = data.get('features')
        self.feature_names = data.get('feature_names')
        self.target_data = data.get('target')
        self.criterion = parameters.get('criterion')
        self.max_depth = int(parameters.get('max_depth'))
        self.min_samples_split = int(parameters.get('min_samples_split'))
        self.min_samples_leaf = int(parameters.get('min_samples_leaf'))
        min_impurity_decrease = float(parameters.get('min_impurity_decrease', 0))
        # Will only prevent split if >= so increase slightly
        self.min_impurity_decrease = min_impurity_decrease \
            if min_impurity_decrease == 0 \
            else min_impurity_decrease + 0.0001
        self.random_state = 7 if parameters.get('random_state') else None
        self.feature_filter = parameters.get('filter_feature', None)
        if self.feature_filter:
            self._filter_features(self.feature_filter)
        # Move to data dict
        self.labels = np.unique(self.target_data).tolist()
        self.classifier = None

    # Move to pre-processing
    def _filter_features(self, feature_filter: list) -> None:
        """
        Removes features in feature list from data set

        Args:
            feature_filter (list): list of features to be filtered

        Returns:
            None
        """
        indices = [self.feature_names.tolist().index(feature) for feature in feature_filter]
        self.feature_data = np.delete(self.feature_data, indices, axis=1)
        self.feature_names = np.delete(self.feature_names, indices)

    def _get_top_features(self, limit=10) -> List[tuple]:
        """
        Returns (up to) 10 most important feature indices sorted by importance

        Args:
            limit (int): limit of important features to return

        Returns:
            List of tuple(feature name, feature importance score)

        """
        top_indices = np.argsort(self.classifier.feature_importances_)[::-1][:limit]
        return [(self.feature_names[i], round(self.classifier.feature_importances_[i], 4)) for i in top_indices]

    def _get_cross_val_predict(self) -> np.ndarray:
        return skl_cross_val_predict(self.classifier, self.feature_data, self.target_data)

    def _get_cross_val_confusion_matrix(self) -> list:
        predictions = self._get_cross_val_predict()
        return skl_confusion_matrix(self.target_data, predictions).tolist()

    def fit(self) -> 'DecisionTreeWrapper':
        clf = DecisionTreeClassifier(criterion=self.criterion, max_depth=self.max_depth,
                                     min_samples_split=self.min_samples_split,
                                     min_samples_leaf=self.min_samples_leaf,
                                     min_impurity_decrease=self.min_impurity_decrease,
                                     random_state=self.random_state)

        clf.fit(self.feature_data, self.target_data)

        self.classifier = clf

        return self

    def get_classifier(self) -> DecisionTreeClassifier:
        return self.classifier

    def get_summary(self) -> dict:
        important_features = self._get_top_features()
        conf_matrix = self._get_cross_val_confusion_matrix()
        return dict(class_labels=self.labels, confusion_matrix=conf_matrix, important_features=important_features)
