import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Chip, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Lightbulb as LightbulbIcon, Campaign as CampaignIcon } from '@mui/icons-material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // Replacement for Target icon
import { getUserFriendlyErrorMessage } from '../../utils/errorHandling';
import api from '../../utils/api';

interface StrategicInsightsProps {
  clientId: string;
  briefId: string;
}

interface StrategicInsight {
  id: string;
  key_insights: string[];
  recommended_approach: string;
  target_platforms: string[];
  content_themes: string[];
}

/**
 * Strategic insights component for displaying insights generated from a brief
 */
const StrategicInsights: React.FC<StrategicInsightsProps> = ({ clientId, briefId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<StrategicInsight | null>(null);
  
  /**
   * Load strategic insights from API
   */
  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get strategic insights from API
      const response = await api.get(`/api/strategy/insights/${briefId}`, {
        headers: {
          'x-client-id': clientId,
        },
      });
      
      console.log('Strategic insights loaded successfully:', response.data);
      
      // Set insights
      setInsights(response.data.data.insights || null);
    } catch (error) {
      console.error('Error loading strategic insights:', error);
      setError(getUserFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load insights on component mount
  useEffect(() => {
    loadInsights();
  }, [briefId, clientId]);
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Strategic Insights
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : !insights ? (
        <Typography variant="body1" color="text.secondary">
          No strategic insights found for this brief.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Key Insights
                </Typography>
                
                <List>
                  {insights.key_insights.map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LightbulbIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={insight} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Recommended Approach
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {insights.recommended_approach}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Target Platforms
                  </Typography>
                  
                  <Box>
                    {insights.target_platforms.map((platform) => (
                      <Chip
                        key={platform}
                        label={platform}
                        icon={<CampaignIcon />}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Content Themes
                  </Typography>
                  
                  <Box>
                    {insights.content_themes.map((theme) => (
                      <Chip
                        key={theme}
                        label={theme}
                        icon={<TrackChangesIcon />}
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default StrategicInsights;
